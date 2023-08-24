import mongoose from "mongoose"

const conectarDB = async ()=>{
    try {

        const connection = await mongoose.connect(process.env.MONGO_URI)

        const url = `${connection.connection.host}:${connection.connection.port}`
        console.log(`Conectado en ${url}`);
        
    } catch (error) {
        console.log(`error: ${error}`)
        process.exit(1);
    }
}

export{
    conectarDB,
}