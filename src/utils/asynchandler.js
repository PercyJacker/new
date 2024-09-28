//method banke export krte h idhar

//!method1 for async handler
//function ke andar ek aur function and then a callback{}
const asynchandler= (fn)=>{async()=>{
    try {
        await fn(req,res,next)
    } catch (error) {

        res.status(err.code || 500).json({
            success: false,
            message: err.message
        })
    }
}}

export {asynchandler}

