import "@apollo/client";

// Apollo Client 4 : les `defaultOptions` du client doivent être déclarés pour
// le typage. On déclare l'`errorPolicy` utilisé par `lib/graphql.ts`.
declare module "@apollo/client" {
  namespace ApolloClient {
    namespace DeclareDefaultOptions {
      interface WatchQuery {
        errorPolicy: "all";
      }
      interface Query {
        errorPolicy: "all";
      }
    }
  }

  // Rester en signatures « classic » : ce projet targue les résultats des hooks
  // via des génériques manuels (<Record<string, any>>), que les signatures
  // « modern » n'acceptent pas. Migration vers TypedDocumentNode ultérieure.
  export interface TypeOverrides {
    signatureStyle: "classic";
  }
}
