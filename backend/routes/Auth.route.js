import { Router } from "express";
import { registration ,login ,logout} from "../controllers/Auth.Controller.js"



export const Authrouter= Router()


Authrouter.post("/registration",registration)

Authrouter.post("/login",login) 



Authrouter.post("/logout",logout)