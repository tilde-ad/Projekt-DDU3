class Dogbreed {
    static Breeds = ["huskies", "rasker", "Collie"]  //här måste vo göra en request för att få dogbreedsen
    // men då måste vi kanske göra en static allbreeds funktion
  
    get dogBreed(){ 
        return this._dogBreed
    }
    set  dogBreed(value){
        if(!Dogbreed.Breeds.includes(value)){
            console.log("error")
        }
        this._dogBreed = value
    }
}


console.log(Dogbreed.Breeds[0])