const config = (() => {
    console.log("Config loaded")
    console.log(process.env);
    return {
        "VUE_APP_ENV_MyURL": "...",
    };
})();