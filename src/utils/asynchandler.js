//method banke export krte h idhar

//!method1 for async handler
//function ke andar ek aur function and then a callback{}
const asynchandler= (requestHandler) => {
    return (req, res ,next ) => {
        Promise.resolve(requestHandler(req,res,next)).catch
        ((err)=>next(err))
    }
}
  

export {asynchandler}

