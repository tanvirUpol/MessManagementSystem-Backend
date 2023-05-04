// mongoose models
import Member from "../models/Member.js";
import Bazar from "../models/Bazar.js";
import  jwt  from "jsonwebtoken";
import requireAuth from "../middleware/requireAuth.js";



import {
        GraphQLSchema, 
        GraphQLID, 
        GraphQLObjectType, 
        GraphQLString,
        GraphQLList,
        GraphQLNonNull,
        GraphQLEnumType,
        GraphQLInt
     } from "graphql"      

const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET, {expiresIn: '3d'})
}   

// Member types
const MemberType = new GraphQLObjectType({
    name: "Member",
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        phone: { type: GraphQLString },
        password: { type: GraphQLString },
        messName: { type: GraphQLString},
        role: { type: GraphQLString },
        token: { type: GraphQLString}
        
    })
})

// Bazar types

const BazarType = new GraphQLObjectType({
    name: "Bazar",
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        price: { type: GraphQLInt},
        memberId: { type: GraphQLString },
        member: {
            type: MemberType,
            resolve(parent,args) {
                return Member.findById(parent.memberId);
            }
        }
    })
})

const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    fields: {
        members: {
            type: new GraphQLList(MemberType),
            resolve: () => {
                return Member.find();
            }
        },
        member: {
            type: MemberType,
            args: {
                id: { type: GraphQLID },
            },
            resolve: (parent, args) => {      
                return Member.findById(args.id);
            }
        },

        
        bazars: {
            type: new GraphQLList(BazarType),
            resolve: (parent,args,context) => {
                const user = requireAuth(context)
                console.log(user._id);
                return Bazar.find({memberId: user._id});
            }
        },
        bazar: {
            type: BazarType,
            args: {
                id: { type: GraphQLID }
            },
            resolve: (parent, args) => {
                return Bazar.findById(args.id);
            }
        }
    }
})

// mutations

const mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        // Add Member
        addMember: {
            type: MemberType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                phone: { type: new GraphQLNonNull(GraphQLString) },
                password: { type: new GraphQLNonNull(GraphQLString) },
                messName: { type: new GraphQLNonNull(GraphQLString) },
                role: { type: new GraphQLEnumType({
                    name: "RoleStatus",
                    values: {
                        'member': { value: "Regular" },
                        'admin': { value: "Admin" }
                    }
                }),
                defaultValue: 'Member',
             }
            },
            resolve: async (parent, args) => {
                const member = new Member({
                    name: args.name,
                    phone: args.phone,
                    password: args.password,
                    messName: args.messName,
                    role: args.role
                })
            
                const user = await Member.signup(member)
                console.log(user)
                return user.save();
            }
        },
        // login user
        loginMember: {
            type: MemberType,
            args: {
                // id: { type: GraphQLID },
                phone: { type: GraphQLString },
                password: { type: GraphQLString },
            },
            resolve: async (parent, args) => {

                const member = new Member({
                    phone: args.phone,
                    password: args.password,
                    
                })
            
                const user = await Member.login(member)

                // create a token
                const token = createToken(user._id)
                
                return {phone: user.phone,  token};
            
            }
        },
        // Delete a member
        deleteMember: {
            type: MemberType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve: (parent, args) => {
                return Member.findByIdAndRemove(args.id);
            }
        },
        // Update a member
        updateMember: {
            type: MemberType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                name: { type:  GraphQLString },
                phone: { type: GraphQLString },
                password: { type: GraphQLString },
                messName: { type: GraphQLString },
                role: { 
                    type: new GraphQLEnumType({
                    name: "UpdateRoleStatus",
                    values: {
                            'member': { value: "Regular" },
                            'admin': { value: "Admin" }
                            }
                        }),
                    }
            },
            resolve: (parent, args) => {
                return Member.findByIdAndUpdate(args.id,{
                    name: args.name,
                    phone: args.phone,
                    password: args.password,
                    messName: args.messName,
                    role: args.role
                });
            }
        },
        // Add Bazar
        addBazar: {
            type: BazarType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                description: { type: new GraphQLNonNull(GraphQLString) },
                price: { type: new GraphQLNonNull(GraphQLInt) },
                // memberId: { type: new GraphQLNonNull(GraphQLID) },
                
            },
            resolve: async (parent, args,context) => {
                // console.log(`Token: ${context}`);
                const user = requireAuth(context)
                // console.log(user);
                const newBazar = new Bazar({
                    name: args.name,
                    description: args.description,
                    price: args.price,
                    memberId: user._id,
                  });

                  // Save the new Bazar to the database
                const savedBazar = await newBazar.save();
                return savedBazar
            }
        },
        // delete bazar
        deleteBazar: {
            type: BazarType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve: (parent, args) => {
                return Bazar.findByIdAndRemove(args.id);
            }
        },
        // update bazar
        updateBazar: {
            type: BazarType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                name: { type: GraphQLString },
                description: { type: GraphQLString },
                price: { type: GraphQLInt }
            },
            resolve: (parent, args) => {
                return Bazar.findByIdAndUpdate(args.id,{
                    name: args.name,
                    description: args.description,
                    price: args.price
                });
            }
        }
    }
})

export default new GraphQLSchema({
    query: RootQuery,
    mutation
})