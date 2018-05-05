module.exports = {
    mode: 'production',
    module:{
        rules:[
            {
                test:'/\.test\.loader$/',
                use:'shit-loader'
            }
        ]
    }
}