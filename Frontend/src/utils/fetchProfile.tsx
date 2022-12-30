
async  function getProfile  ()  {

// console.log("Fetching Profile Infos   => ");


// const auth =   await 
const endpoint = process.env.REACT_APP_BACK_URL + '/player/myprofile'
// console.log(" this endpoint " + endpoint)

await fetch(endpoint,{
    // mode:'no-cors',
    method:'get',
    credentials:"include"
})

.then((response) => response.json())
.then(json => {
    console.log("The response is => " + JSON.stringify(json))

    if(String(json.statusCode) === "401")
    {
    localStorage.setItem("authenticated","");
  localStorage.setItem("user","");
  localStorage.setItem("trylogin","false");

    window.location.reload();
    }
    else
    {
        localStorage.setItem("authenticated","true");
        localStorage.setItem("user",JSON.stringify(json));
        localStorage.setItem("trylogin","false");
          window.location.href = process.env.REACT_APP_FRONT_URL + "/"
    }

  
    return json;
})
.catch((error) => {
    // console.log("An error occured : " + error)
    localStorage.setItem("authenticated","");
    localStorage.setItem("user","");
    localStorage.setItem("trylogin","false");

    return error;
})

}

export default getProfile;
