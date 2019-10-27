const { ApolloServer, gql } = require("apollo-server");
const { RESTDataSource } = require("apollo-datasource-rest");

const typeDefs = gql`
  type Country {
    name: String!
    capital: String!
    population: Int!
  }

  type Query {
    allCountries: [Country!]!
    countryByName(name: String!): Country!
  }
`;

const resolvers = {
  Query: {
    allCountries: async (parent, args, { dataSources }) => {
      return dataSources.countriesAPI.getAllCountries();
    },
    countryByName: async (parent, { name }, { dataSources }) => {
      let countryData = dataSources.countriesAPI.getCountryByName(name);
      return countryData.then(data => data[0]);
    }
  }
};

class CountriesAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = "https://restcountries.eu/rest/v2";
  }
  async getAllCountries() {
    return this.get("/all");
  }
  async getCountryByName(name) {
    return this.get(`/name/${name}`);
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => {
    return {
      countriesAPI: new CountriesAPI()
    };
  }
});

server.listen().then(({ url }) => console.log(`Server running on ${url}`));
