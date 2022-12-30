
const   IsAuthOk = (key:string) => {

    if(String(key) === "401")
    {
        localStorage.setItem("authenticated","");
        localStorage.setItem("user","");
        localStorage.setItem("trylogin","false");
        window.location.reload();
        return(1);
    }
return (0);

}
function containsSpecialChars(str) {
  // eslint-disable-next-line 
  const specialChars = /[`!@#$%^ &*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  return specialChars.test(str);
}


function containsSpecialChars2(str) {
  // eslint-disable-next-line 
    const specialChars = /[`!@#$%^ &*()_+\=\[\]{};':"\\|,.<>\/?~]/;
    return specialChars.test(str);
  }

 

export {
    IsAuthOk
    ,containsSpecialChars,
    containsSpecialChars2,
}

