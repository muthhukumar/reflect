import config from '../../config.ts';
import isFunction from '../../is-function.ts';
export default function sourceListCheck(key, value) {
    if (value === false) {
        return;
    }
    if (!Array.isArray(value)) {
        throw new Error(`"${value}" is not a valid value for ${key}. Use an array of strings.`);
    }
    if (value.length === 0) {
        throw new Error(`${key} must have at least one value. To block everything, set ${key} to ["'none'"].`);
    }
    value.forEach((sourceExpression) => {
        if (!sourceExpression) {
            throw new Error(`"${sourceExpression}" is not a valid source expression. Only non-empty strings are allowed.`);
        }
        if (isFunction(sourceExpression)) {
            return;
        }
        sourceExpression = sourceExpression.valueOf();
        if (typeof sourceExpression !== 'string' || sourceExpression.length === 0) {
            throw new Error(`"${sourceExpression}" is not a valid source expression. Only non-empty strings are allowed.`);
        }
        const directiveInfo = config.directives[key];
        if (!directiveInfo.hasUnsafes && config.unsafes.indexOf(sourceExpression) !== -1 ||
            !directiveInfo.hasStrictDynamic && config.strictDynamics.indexOf(sourceExpression) !== -1) {
            throw new Error(`"${sourceExpression}" does not make sense in ${key}. Remove it.`);
        }
        if (config.mustQuote.indexOf(sourceExpression) !== -1) {
            throw new Error(`"${sourceExpression}" must be quoted in ${key}. Change it to "'${sourceExpression}'" in your source list. Force this by enabling loose mode.`);
        }
    });
}
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlLWxpc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzb3VyY2UtbGlzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE1BQU0sTUFBTSxpQkFBaUIsQ0FBQztBQUNyQyxPQUFPLFVBQVUsTUFBTSxzQkFBc0IsQ0FBQztBQVE5QyxNQUFNLENBQUMsT0FBTyxVQUFVLGVBQWUsQ0FBRSxHQUFXLEVBQUUsS0FBYztJQUNsRSxJQUFJLEtBQUssS0FBSyxLQUFLLEVBQUU7UUFBRSxPQUFPO0tBQUU7SUFFaEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDekIsTUFBTSxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssOEJBQThCLEdBQUcsNEJBQTRCLENBQUMsQ0FBQztLQUN6RjtJQUVELElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDdEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLEdBQUcsMkRBQTJELEdBQUcsaUJBQWlCLENBQUMsQ0FBQztLQUN4RztJQUVELEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFO1FBQ2pDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtZQUNyQixNQUFNLElBQUksS0FBSyxDQUFDLElBQUksZ0JBQWdCLHlFQUF5RSxDQUFDLENBQUM7U0FDaEg7UUFFRCxJQUFJLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO1lBQUUsT0FBTztTQUFFO1FBRTdDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRTlDLElBQUksT0FBTyxnQkFBZ0IsS0FBSyxRQUFRLElBQUksZ0JBQWdCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUN6RSxNQUFNLElBQUksS0FBSyxDQUFDLElBQUksZ0JBQWdCLHlFQUF5RSxDQUFDLENBQUM7U0FDaEg7UUFFRCxNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQXFDLENBQXFCLENBQUM7UUFFbkcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUUsQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLElBQUksTUFBTSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUMzRixNQUFNLElBQUksS0FBSyxDQUFDLElBQUksZ0JBQWdCLDRCQUE0QixHQUFHLGNBQWMsQ0FBQyxDQUFDO1NBQ3BGO1FBRUQsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQ3JELE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBSSxnQkFBZ0IsdUJBQXVCLEdBQUcsb0JBQW9CLGdCQUFnQiw0REFBNEQsQ0FBQyxDQUFDO1NBQ2pLO0lBQ0gsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBQUEsQ0FBQyJ9