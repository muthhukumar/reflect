// Copyright 2018-2020 the oak authors. All rights reserved. MIT license.
// This was inspired by [keygrip](https://github.com/crypto-utils/keygrip/)
// which allows signing of data (cookies) to prevent tampering, but also allows
// for easy key rotation without needing to resign the data.
import { HmacSha256 } from "./deps.ts";
import { compare } from "./tssCompare.ts";
const replacements = {
    "/": "_",
    "+": "-",
    "=": "",
};
export class KeyStack {
    /** A class which accepts an array of keys that are used to sign and verify
     * data and allows easy key rotation without invalidation of previously signed
     * data.
     *
     * @param keys An array of keys, of which the index 0 will be used to sign
     *             data, but verification can happen against any key.
     */
    constructor(keys) {
        this.#sign = (data, key) => {
            return btoa(String.fromCharCode.apply(undefined, new Uint8Array(new HmacSha256(key).update(data).arrayBuffer())))
                .replace(/\/|\+|=/g, (c) => replacements[c]);
        };
        if (!(0 in keys)) {
            throw new TypeError("keys must contain at least one value");
        }
        this.#keys = keys;
    }
    #keys;
    #sign;
    /** Take `data` and return a SHA256 HMAC digest that uses the current 0 index
     * of the `keys` passed to the constructor.  This digest is in the form of a
     * URL safe base64 encoded string. */
    sign(data) {
        return this.#sign(data, this.#keys[0]);
    }
    /** Given `data` and a `digest`, verify that one of the `keys` provided the
     * constructor was used to generate the `digest`.  Returns `true` if one of
     * the keys was used, otherwise `false`. */
    verify(data, digest) {
        return this.indexOf(data, digest) > -1;
    }
    /** Given `data` and a `digest`, return the current index of the key in the
     * `keys` passed the constructor that was used to generate the digest.  If no
     * key can be found, the method returns `-1`. */
    indexOf(data, digest) {
        for (let i = 0; i < this.#keys.length; i++) {
            if (compare(digest, this.#sign(data, this.#keys[i]))) {
                return i;
            }
        }
        return -1;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5U3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJrZXlTdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSx5RUFBeUU7QUFFekUsMkVBQTJFO0FBQzNFLCtFQUErRTtBQUMvRSw0REFBNEQ7QUFFNUQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUN2QyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFLMUMsTUFBTSxZQUFZLEdBQTJCO0lBQzNDLEdBQUcsRUFBRSxHQUFHO0lBQ1IsR0FBRyxFQUFFLEdBQUc7SUFDUixHQUFHLEVBQUUsRUFBRTtDQUNSLENBQUM7QUFFRixNQUFNLE9BQU8sUUFBUTtJQUduQjs7Ozs7O09BTUc7SUFDSCxZQUFZLElBQVc7UUFPdkIsVUFBSyxHQUFHLENBQUMsSUFBVSxFQUFFLEdBQVEsRUFBVSxFQUFFO1lBQ3ZDLE9BQU8sSUFBSSxDQUNULE1BQU0sQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUN2QixTQUFTLEVBQ1QsSUFBSSxVQUFVLENBQUMsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFRLENBQ3RFLENBQ0Y7aUJBQ0UsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakQsQ0FBQyxDQUFDO1FBZEEsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFO1lBQ2hCLE1BQU0sSUFBSSxTQUFTLENBQUMsc0NBQXNDLENBQUMsQ0FBQztTQUM3RDtRQUNELElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQ3BCLENBQUM7SUFkRCxLQUFLLENBQVE7SUFnQmIsS0FBSyxDQVFIO0lBRUY7O3lDQUVxQztJQUNyQyxJQUFJLENBQUMsSUFBVTtRQUNiLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFRDs7K0NBRTJDO0lBQzNDLE1BQU0sQ0FBQyxJQUFVLEVBQUUsTUFBYztRQUMvQixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFRDs7b0RBRWdEO0lBQ2hELE9BQU8sQ0FBQyxJQUFVLEVBQUUsTUFBYztRQUNoQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDMUMsSUFBSSxPQUFPLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNwRCxPQUFPLENBQUMsQ0FBQzthQUNWO1NBQ0Y7UUFDRCxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ1osQ0FBQztDQUNGIn0=