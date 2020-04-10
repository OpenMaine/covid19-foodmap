const Util = {
    getQueryParams: () => {
        const queryDictionary = {};
        if (location.search) {
            const queryComponents = location.search.substr(1).split(`&`);
            queryComponents.forEach(item => {
                let [k,v] = item.split(`=`); 
                v = v && decodeURIComponent(v); 
                (queryDictionary[k] = queryDictionary[k] || []).push(v);
            });
        }
        return queryDictionary;
    },

    isNullOrEmpty: (value) => {
        if (value === null || value === undefined)
            return true;
        if (value.constructor.name === "String")
            return value.trim().length === 0;
        if (value.constructor.name === "Array")
            return value.length === 0;
        return false;
    }
}