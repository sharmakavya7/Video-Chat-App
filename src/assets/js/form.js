  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  var firebaseConfig = {
    apiKey: "AIzaSyAt2TW7kvzbyyWlPn7KF_j1h-wIgiatFZ8",
    authDomain: "video-chat-app-f3086.firebaseapp.com",
    projectId: "video-chat-app-f3086",
    storageBucket: "video-chat-app-f3086.appspot.com",
    messagingSenderId: "208057507301",
    appId: "1:208057507301:web:88e9f7e408c44ea02b630c",
    measurementId: "G-SG1SKR042R"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  //firebase.analytics();
  const auth =  firebase.auth();

  //signup function
  function signUp(){
    var email = document.getElementById('email');
    var password = document.getElementById("password");

    const promise = auth.createUserWithEmailAndPassword(email.value,password.value);
    //
    promise.catch(e=>alert(e.message));
    alert("SignUp Successfully");
    location.href="/teams";
  }

  //signIN function
  function  signIn(){
    var email = document.getElementById("email");
    var password  = document.getElementById("password");
    const promise = auth.signInWithEmailAndPassword(email.value,password.value);
    promise.catch(e=>alert(e.message));
    
  }


  //signOut

  function signOut(){
    auth.signOut();
    alert("SignOut Successfully from System");
  }


  //active user to homepage
  firebase.auth().onAuthStateChanged((user)=>{
    if(user){
      var email = user.email;
      alert("Active user "+email);

    }else{
      alert("No Active user Found")
    }
  })