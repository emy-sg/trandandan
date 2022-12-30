import './DisplayAchievementsList.css'
const DisplayAchievementsList = (props) => {
// console.log("Achievements props . ", props)

    return (
        <>
        <div className='Achievements-Back'>
            <div className='Achievements-container'>
        <ul className='AchievementsList'>
        
            <li>
            
            <span>{props.AchievementsList.name} </span> 

<div className='unlocked-div'>
<img  className='avatar1' src={props.AchievementsList.avatar} alt="Achivementsavatar" /> 
<span>{props.AchievementsList.description} </span>
    
      <button type="button" className='has-border' >
      <span className="icon material-symbols-outlined">
     {"lock_open"}        </span> 
      </button>
      </div>

</li>
        </ul>
        </div>
        </div>
       
        </>
    )
}

export default DisplayAchievementsList