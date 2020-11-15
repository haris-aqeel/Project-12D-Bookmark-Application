const { ApolloServer, gql } = require('apollo-server-lambda')
const faunadb = require("faunadb"),
q = faunadb.query



const typeDefs = gql`
  type Query {
    bookmark: [Bookmark!]    
  }
  type Bookmark{
    id: ID!
    url: String!
    desc: String!
    createdAt: String!
   
  }

  type Mutation {
    addBookmark(url: String!, desc: String!, createdAt: String!) : Bookmark
    removeBookmark(id: ID!): Bookmark
  }
`

// const authors = [
//   { id: 1, url: 'https://github.com/gatsbyjs/gatsby-starter-hello-world', desc: "this is a github gatsby official repository", createdAt: "200" },
//   { id: 1, url: 'https://github.com/gatsbyjs/gatsby-starter-hello-world', desc: "this is a github gatsby official repository", createdAt: "200"  },
//   { id: 1, url: 'https://github.com/gatsbyjs/gatsby-starter-hello-world', desc: "this is a github gatsby official repository", createdAt: "200" },
// ]

const resolvers = {
  Query: {
    bookmark: async (root, args, context)=> {
      try{
        var client = new faunadb.Client({ secret: "fnAD6rJnx9ACBQ1NMbazmV_N2EkfjmhsVBXGybaB" });
        var result = await client.query(
          q.Map(
            q.Paginate(q.Match(q.Index("url"))),
            q.Lambda(x => q.Get(x))
          )
        )
        return result.data.map(d => {

          return {
            id: d.ref.id,
            url: d.data.url,
            desc: d.data.desc,
            createdAt: d.data.createdAt
          }
        })
      }
      catch(err){
        console.log('err',err);
      }}},

      Mutation: {
        addBookmark: async (_, {url,desc, createdAt}) => {

          try {
            var client = new faunadb.Client({ secret: "fnAD6rJnx9ACBQ1NMbazmV_N2EkfjmhsVBXGybaB" });
            var result = await client.query(
              q.Create(
                q.Collection('links'),
                { data: { 
                  url,
                  desc,
                  createdAt
                 } },
              )
    
            );
            return result.ref.data
    
          } 
          catch (error){
              console.log('Error: ');
              console.log(error);
          }
        },

        removeBookmark: async (_, {id}) => {

          console.log(id)
          try {
            var client = new faunadb.Client({ secret: "fnAD6rJnx9ACBQ1NMbazmV_N2EkfjmhsVBXGybaB" });
            var result = await client.query(

              q.Delete(q.Ref(q.Collection("links"), id))
    
            );

            return result.ref.data
    
          } 
          catch (error){
              console.log('Error: ');
              console.log(error);
          }
        }
    },
  
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

exports.handler = server.createHandler();
