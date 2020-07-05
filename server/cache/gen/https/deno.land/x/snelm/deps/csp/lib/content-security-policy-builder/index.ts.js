function dashify(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase();
}
export default function ({ directives }) {
    const keysSeen = {};
    return Object.keys(directives).reduce((result, originalKey) => {
        const directive = dashify(originalKey);
        if (keysSeen[directive]) {
            throw new Error(`${originalKey} is specified more than once`);
        }
        keysSeen[directive] = true;
        let value = directives[originalKey];
        if (Array.isArray(value)) {
            value = value.join(' ');
        }
        else if (value === true) {
            value = '';
        }
        else if (value === false) {
            return result;
        }
        if (value) {
            return result.concat(`${directive} ${value}`);
        }
        else {
            return result.concat(directive);
        }
    }, []).join('; ');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLE9BQU8sQ0FBRSxHQUFXO0lBQzNCLE9BQU8sR0FBRztTQUNQLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLENBQUM7U0FDbkMsV0FBVyxFQUFFLENBQUM7QUFDbkIsQ0FBQztBQU1ELE1BQU0sQ0FBQyxPQUFPLFdBQVcsRUFBRSxVQUFVLEVBQXdCO0lBQzNELE1BQU0sUUFBUSxHQUFxQyxFQUFFLENBQUM7SUFFdEQsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLE1BQU0sQ0FBVyxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsRUFBRTtRQUN0RSxNQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFdkMsSUFBSSxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUU7WUFDdkIsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLFdBQVcsOEJBQThCLENBQUMsQ0FBQztTQUMvRDtRQUNELFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxJQUFJLENBQUM7UUFFM0IsSUFBSSxLQUFLLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3BDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUN4QixLQUFLLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN6QjthQUFNLElBQUksS0FBSyxLQUFLLElBQUksRUFBRTtZQUN6QixLQUFLLEdBQUcsRUFBRSxDQUFDO1NBQ1o7YUFBTSxJQUFJLEtBQUssS0FBSyxLQUFLLEVBQUU7WUFDMUIsT0FBTyxNQUFNLENBQUM7U0FDZjtRQUVELElBQUksS0FBSyxFQUFFO1lBQ1QsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsU0FBUyxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUM7U0FDL0M7YUFBTTtZQUNMLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUNqQztJQUNILENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDcEIsQ0FBQyJ9