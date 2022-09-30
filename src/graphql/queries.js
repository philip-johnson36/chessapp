/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getPosition = /* GraphQL */ `
  query GetPosition($id: ID!) {
    getPosition(id: $id) {
      id
      fen
      pgn
      moves
      image
      author
      createdAt
      updatedAt
    }
  }
`;
export const listPositions = /* GraphQL */ `
  query ListPositions(
    $filter: ModelPositionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPositions(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        fen
        pgn
        moves
        image
        author
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
