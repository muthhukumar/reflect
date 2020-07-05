// Copyright 2018-2020 the oak authors. All rights reserved. MIT license.
function isRouterContext(value) {
    return "params" in value;
}
export function getQuery(ctx, { mergeParams, asMap } = {}) {
    const result = {};
    if (mergeParams && isRouterContext(ctx)) {
        Object.assign(result, ctx.params);
    }
    for (const [key, value] of ctx.request.url.searchParams) {
        result[key] = value;
    }
    return asMap ? new Map(Object.entries(result)) : result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImhlbHBlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEseUVBQXlFO0FBS3pFLFNBQVMsZUFBZSxDQUFDLEtBQWM7SUFDckMsT0FBTyxRQUFRLElBQUksS0FBSyxDQUFDO0FBQzNCLENBQUM7QUE4QkQsTUFBTSxVQUFVLFFBQVEsQ0FDdEIsR0FBNEIsRUFDNUIsRUFBRSxXQUFXLEVBQUUsS0FBSyxLQUF1QixFQUFFO0lBRTdDLE1BQU0sTUFBTSxHQUEyQixFQUFFLENBQUM7SUFDMUMsSUFBSSxXQUFXLElBQUksZUFBZSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQ3ZDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUNuQztJQUNELEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUU7UUFDdkQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztLQUNyQjtJQUNELE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztBQUMxRCxDQUFDIn0=