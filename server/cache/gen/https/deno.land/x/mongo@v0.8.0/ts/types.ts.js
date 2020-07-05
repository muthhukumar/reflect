export var CommandType;
(function (CommandType) {
    CommandType["ConnectWithUri"] = "ConnectWithUri";
    CommandType["ConnectWithOptions"] = "ConnectWithOptions";
    CommandType["ListDatabases"] = "ListDatabases";
    CommandType["ListCollectionNames"] = "ListCollectionNames";
    CommandType["Find"] = "Find";
    CommandType["InsertOne"] = "InsertOne";
    CommandType["InsertMany"] = "InsertMany";
    CommandType["Delete"] = "Delete";
    CommandType["Update"] = "Update";
    CommandType["Aggregate"] = "Aggregate";
    CommandType["Count"] = "Count";
    CommandType["CreateIndexes"] = "CreateIndexes";
})(CommandType || (CommandType = {}));
export function ObjectId($oid) {
    const isLegal = /^[0-9a-fA-F]{24}$/.test($oid);
    if (!isLegal) {
        throw new Error(`ObjectId("${$oid}") is not legal.`);
    }
    return { $oid };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0eXBlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLENBQU4sSUFBWSxXQWFYO0FBYkQsV0FBWSxXQUFXO0lBQ3JCLGdEQUFpQyxDQUFBO0lBQ2pDLHdEQUF5QyxDQUFBO0lBQ3pDLDhDQUErQixDQUFBO0lBQy9CLDBEQUEyQyxDQUFBO0lBQzNDLDRCQUFhLENBQUE7SUFDYixzQ0FBdUIsQ0FBQTtJQUN2Qix3Q0FBeUIsQ0FBQTtJQUN6QixnQ0FBaUIsQ0FBQTtJQUNqQixnQ0FBaUIsQ0FBQTtJQUNqQixzQ0FBdUIsQ0FBQTtJQUN2Qiw4QkFBZSxDQUFBO0lBQ2YsOENBQStCLENBQUE7QUFDakMsQ0FBQyxFQWJXLFdBQVcsS0FBWCxXQUFXLFFBYXRCO0FBS0QsTUFBTSxVQUFVLFFBQVEsQ0FBQyxJQUFZO0lBQ25DLE1BQU0sT0FBTyxHQUFHLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMvQyxJQUFJLENBQUMsT0FBTyxFQUFFO1FBQ1osTUFBTSxJQUFJLEtBQUssQ0FBQyxhQUFhLElBQUksa0JBQWtCLENBQUMsQ0FBQztLQUN0RDtJQUNELE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUNsQixDQUFDIn0=