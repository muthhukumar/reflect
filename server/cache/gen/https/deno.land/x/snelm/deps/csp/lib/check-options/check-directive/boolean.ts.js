import isBoolean from '../../is-boolean.ts';
export default function (key, value) {
    if (!isBoolean(value)) {
        throw new Error(`"${value}" is not a valid value for ${key}. Use \`true\` or \`false\`.`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vbGVhbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJvb2xlYW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxTQUFTLE1BQU0scUJBQXFCLENBQUM7QUFFNUMsTUFBTSxDQUFDLE9BQU8sV0FBVyxHQUFXLEVBQUUsS0FBYztJQUNsRCxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ3JCLE1BQU0sSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLDhCQUE4QixHQUFHLDhCQUE4QixDQUFDLENBQUM7S0FDM0Y7QUFDSCxDQUFDIn0=