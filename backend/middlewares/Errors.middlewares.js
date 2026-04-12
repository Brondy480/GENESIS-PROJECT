// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err , req , res , next) => {
    try {
       let error = {...err};
       
       error.message = err.message;

       console.error(error)

       //definition of all common mongoose error 

       //1 mongoose bad ObjectId
      
       if(err.name ==='CastError'){
        const message = 'Resource not found';
        error = new Error(message);
        error.statusCode = 404;
       }

       //2 mongoose duplication key 
       if(error.code ===11000){
        const message = Object.values(err.errors).map(val => val.message);
        error = new error(message.join(','));
        error.statusCode = 400;
       }

       if(err.name ==='ValidationError'){
        const message = Object.values(err.error).map(val=>val.message)
        error = new error(message.join(','));
        error.statusCode = 400;
       }

       res.status(error.statusCode ||500).json({sucess : false,error : error.message ||'server Error'});



    } catch (error) {
        next(error)
    }

};


export default errorMiddleware;