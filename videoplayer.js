const RegexName = new RegExp("^[a-zA-Z0-9_ ]{1,20}$");
let HTMLCatalog=document.querySelector('.listMovies');
let HTMLPlayers=document.querySelector('.playing');

//------------------- Class to create the DATA -------------------//
//Class Movie
class Movie {
    constructor (object,catalog) {
        if (this.#validationMovieDetails(object)) {
            this.Name=object.Name;
            this.Length=object.Length;
            this.UUid=crypto.randomUUID();
            catalog.addMovie(this);
        }
    }

    #validationMovieDetails(object) {
        if (RegexName.test(object.Name) && Number.isInteger(object.Length)) {
            return true;
        } else {
            throw new Error(`Movie details not valid for: ${object.Name}, ${object.Length}`)
        }
    }

}

class Player {
    constructor (user) {
        if(this.#validationClassUser(user)) {
            this.User=user;
            this.Counter=null;
            this.Timer=null;
            this.Movie=null;
            Appli.addPlayer(this);  
        }
    }

    #validationClassUser(user) {
        if (!user instanceof User) {
            throw new Error (user,`this argument is not a class User`);
        } else {
            return true;
        }
    }

    play(movie, counter) {
        this.Counter=counter;
        this.Movie=movie;
        clearInterval(this.Timer);
        
        let playerDiv=document.getElementById(this.User.UUid);
        if(!playerDiv) {
            playerDiv=createPlayerHTML(this);
        }

        return new Promise ((resolve,reject)=> {
            this.Timer = setInterval(()=> {
                if (this.Counter > 1000) {
                    this.Counter=this.Counter-1000;
                    playerDiv.querySelector('.counter').innerHTML=`${changeFormatToHH_MM_SS(this.Movie.Length - this.Counter)} / ${changeFormatToHH_MM_SS(this.Movie.Length)}`;
                } else {
                    clearInterval(this.Timer);
                    playerDiv.remove();
                    resolve(this.Movie);
                }
            },1000);
        }); 
    }

    pause() {
        clearInterval(this.Timer);
        return(this.Counter);
    }
}

//Class User
class User {
    constructor (object) {
        if (this.#validationUserDetails(object)) {
            this.Name= object.Name;
            this.Favorites=[];
            this.Progressions=[];
            this.UUid=crypto.randomUUID();
            Appli.addUser(this);
        }

    }

    #validationUserDetails(object) {
        if (RegexName.test(object.Name)) {
            return true;
        } else {
            throw new Error(`User details not valid for: ${object.Name}`)
        }   
    }

    #validationClassMovie(movie) {
        if (!movie instanceof Movie) {
            throw new Error (movie,`this argument is not a class Movie`);
        } else {
            return true;
        }
    }

    clearFavorites() {
        this.Favorites=[];
    }

    clearProgressions() {
        this.Progressions=[];
    }

    #getFavorite (movie) {
        return this.Favorites.find(favorite=> {return movie.UUid==favorite.UUid});
    }

    #getProgression (movie) {
        return this.Progressions.find(progression=> {return movie.UUid==progression[0].UUid});
    }

    displayFavorites () {
        console.log(" - Favorite movies of " + this.Name + " -");
        this.Favorites.sort((movie1,movie2) => { 
            if (movie1.Name > movie2.Name) {return 1}
            else if ( movie1.Name < movie2.Name) {return -1}
            else return 0
        }).forEach(movie => {
            console.log(`${movie.Name} / ${changeFormatToHH_MM_SS(movie.Length)}`);
        })
    }

    displayProgression() {
        console.log(" - Progression " + this.Name + " -");
        this.Progressions.sort((progress1,progress2) => { 
            if (progress1[0].Name > progress2[0].Name) {return 1}
            else if ( progress1[0].Name < progress2[0].Name) {return -1}
            else return 0
        }).forEach(progress => {
            console.log(`${progress[0].Name} --- ${changeFormatToHH_MM_SS(progress[0].Length - progress[1])} / ${changeFormatToHH_MM_SS(progress[0].Length)}`);
        })
    }

    addFavorite(movie) {
        if (this.#validationClassMovie(movie)) {
            if (!this.#getFavorite(movie)) {
                this.Favorites.push(movie);
            } else {
                throw new Error (movie,`${movie.Name} is already in the favorite of ${this.Name}`)
            }
        }
    }

    deleteFavorite(movie) {
        if ( this.#validationClassMovie(movie)) {
            if (this.#getFavorite(movie)) {
                this.Favorites=this.Favorites.filter(favorite => {return favorite.UUid!=movie.UUid});
            } else {
                throw new Error (movie, `${movie.Name} is not part of the favroites of ${this.Name}`)
            }
        }
    }

    #getPlayer() {
        return(Appli.Players.find(player => player.User.UUid == this.UUid));
    }

    play(movie) {
        if(this.#validationClassMovie(movie)) {
            let player = this.#getPlayer();
            if (!player) {
                player=new Player(this);
            } else {
                this.pause(player);
            }

            if(!this.#getProgression(movie)) {
                player.play(movie, movie.Length).then(result => {
                    console.log(`The movie ${result.Name} is over.`);
                    this.Progressions.push([result,result.Length]);
                    player.Movie=null;
                });
            } else { 
                player.play(movie,this.#getProgression(movie)[1]).then(result => {
                    console.log(`The movie ${result.Name} is over.`);
                    this.#getProgression(result)[1]=result.Length;
                    player.Movie=null;
                });
            }
        }
    }

    pause() {
        let player = this.#getPlayer();
        if (player) {
            if(player.Movie){
                if(!this.#getProgression(player.Movie)) {
                    this.Progressions.push([player.Movie,player.pause()]);
                } else {
                    this.#getProgression(player.Movie)[1]=player.pause();
                }
            }
        }
    }

}

// Classe Catalog
class Catalog {
    constructor (object) {
        if (this.#validationCatalogDetails(object)) {
            this.Name=object.Name;
            this.Movies=[];
            this.UUid=crypto.randomUUID();
            Appli.addCatalog(this);
        }
    }

    #validationCatalogDetails(object) {
        if (RegexName.test(object.Name)) {
            return true;
        } else {
            throw new Error(`Catalog details not valid for: ${object.Name}`)
        }
    }

    #validationClassMovie(movie) {
        if (!movie instanceof Movie) {
            throw new Error (movie,`this argument is not a class Movie`);
        } else {
            return true;
        }
    }

    #getMovie (movie) {
        return this.Movies.find(movie1=> {return movie1.UUid==movie.UUid});
    }

    addMovie(movie) {
        if (this.#validationClassMovie(movie)) {
            if (!this.#getMovie(movie)) {
                this.Movies.push(movie);
                this.displayHTML();
                return(movie);
            } else {
                throw new Error (movie,`${movie.Name}  is already in the catalog ${this.Name}`)
            }
        }
    }

    addMutlipleMovies(movies) {
        movies.forEach(movie=>{
            this.addMovie(movie);
        })
    }

    deleteMovie(movie) {
        if ( this.#validationClassMovie(movie)) {
            if (this.#getMovie(movie)) {
                this.Movies=this.Movies.filter(movie1 => {return movie1.UUid!=movie.UUid});
            } else {
                throw new Error (movie, `${movie.Name} is not part of the catalog ${this.Name}`)
            }
            this.displayHTML();
        }
    }

    deleteMutlipleMovies(movies) {
        movies.forEach(movie=>{
            this.deleteMovie(movie);
        })
    }

    display () {
        console.log(" - " + this.Name + " -");
        this.Movies.sort((movie1,movie2) => { 
            if (movie1.Name > movie2.Name) {return 1}
            else if ( movie1.Name < movie2.Name) {return -1}
            else return 0
        }).forEach(movie => {
            console.log(`${movie.Name} / ${changeFormatToHH_MM_SS(movie.Length)}`);
        })
    }

    displayHTML(){
        HTMLCatalog.innerHTML="";

        this.Movies.sort((movie1,movie2) => { 
            if (movie1.Name > movie2.Name) {return 1}
            else if ( movie1.Name < movie2.Name) {return -1}
            else return 0
        }).forEach(movie => {
            let listMovie=document.createElement("ul");
            listMovie.innerHTML=`${movie.Name} / ${changeFormatToHH_MM_SS(movie.Length)}`;
            HTMLCatalog.appendChild(listMovie);
        }); 
    }
}

class Application {
    constructor () {
        this.Catalogs=[];
        this.Users=[];
        this.Players=[];
    }

    addCatalog(catalog) {
        if ( this.#validationClassCatalog(catalog)) {
            if(!this.#getCatalog (catalog)){
                this.Catalogs.push(catalog);
            } else {
                throw new Error (catalog,`${catalog.Name}  is already in the application`)
            }
        }
    }

    deleteCatalog(catalog) {
        if ( this.#validationClassCatalog(catalog)) {
            if (this.#getCatalog(catalog)) {
                this.Catalogs=this.Catalogs.filter(catalog1 => {return catalog1.UUid!=catalog.UUid});
            } else {
                throw new Error (catalog, `${catalog.Name} is not part of the application.`)
            }
        }
    }
   
    #validationClassCatalog(catalog) {
        if (!catalog instanceof Catalog) {
            throw new Error (catalog,`this argument is not a class Catalog`);
        } else {
            return true;
        }
    }

    #getCatalog (catalog) {
        return this.Catalogs.find(catalog1=> {return catalog1.UUid==catalog.UUid});
    }

    addUser(user) {
        if ( this.#validationClassUser(user)) {
            if(!this.#getUser (user)){
                this.Users.push(user);
            } else {
                throw new Error (user,`${user.Name}  is already in the application`)
            }
        }
    }

    #validationClassUser(user){
        if (!user instanceof User) {
            throw new Error (user,`this argument is not a class User`);
        } else {
            return true;
        }
    }

    #getUser(user){
        return this.Users.find(user1=> {return user1.UUid==user.UUid});
    }

    addPlayer(player) {
        if (this.#validationClassPlayer(player)) {
            if(!this.#getPlayer (player)){
                this.Players.push(player);
            } else {
                throw new Error (player,`${player.Name}  is already in the application`)
            }
        }
    }

    #validationClassPlayer(player){
        if (!player instanceof Player) {
            throw new Error (player,`this argument is not a class Player`);
        } else {
            return true;
        }
    }

    #getPlayer(player){
        return this.Players.find(player1=> {return player1.User.UUid==player.User.UUid});
    }
}


//------------------- Global Functions -------------------//
function changeFormatToHH_MM_SS(duration) {
    let seconds=Math.floor((duration/1000) % 60);
    let minutes=Math.floor((duration / (1000 * 60)) % 60);
    let hours=Math.floor(duration / (1000 * 60 *60));

    if (hours <10) {hours= "0" + hours;}
    if (minutes <10) {minutes= "0" + minutes;}
    if (seconds <10) {seconds= "0" + seconds;}

    return(hours + ":" + minutes + ":" + seconds);
}

function getMovieByID(UUID, catalog) {
    if (!catalog instanceof Catalog) {
        return(catalog.Movies.find(movie=> {return movie.UUid==UUID}));
    } else {
        throw new Error (catalog,`this argument is not a class Catalog`)
    }
}

function createPlayerHTML(player) {
    let newPlayer= document.createElement("div");
    newPlayer.setAttribute("id", player.User.UUid)
    newPlayer.classList.add("player");
    newPlayer.innerHTML=
    `<div>User: <div class="user">${player.User.Name}</div></div>
    <div>Movie playing : <div class="moviePlaying">${player.Movie.Name}</div> </div>
    <div>Timer: <div class="counter">${changeFormatToHH_MM_SS(player.Counter)}</div> </div>`;

    HTMLPlayers.appendChild(newPlayer);
    return newPlayer;
}

//--------------- Create Data ----------------//
let Appli= new Application();
let Movies = new Catalog({Name:"Movies"})
let movie1=new Movie({Name:"Alien", Length:3601000},Movies);
let movie2=new Movie({Name:"Snatch", Length:7260000},Movies);
let movie3=new Movie({Name:"In Bruges", Length:7200000},Movies);
let movie4=new Movie({Name:"Pulp Fiction", Length:6673},Movies);
let movie5=new Movie({Name:"Rogue One", Length:8833},Movies);
let movie6=new Movie({Name:"The Whale", Length:78745},Movies);
let movie7=new Movie({Name:"Prometheus", Length:119922},Movies);
let movie8=new Movie({Name:"The Watchmen", Length:234458},Movies);
let movie9=new Movie({Name:"Poor Little Thing", Length:4588993},Movies);
let movie10=new Movie({Name:"Akira", Length:8519000},Movies);





