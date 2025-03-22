import { FoldersService } from "../services/folders.service";

export class Utils{
    foldersService: FoldersService;
    token: string
    constructor(token:string){
        this.foldersService = new FoldersService();
        this.token = token;
    }
}