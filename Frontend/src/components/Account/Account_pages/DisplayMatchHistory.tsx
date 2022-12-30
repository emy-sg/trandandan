import {useState, useEffect} from 'react'
import {Link} from'react-router-dom';

import './DisplayMatchHistory.css'
const DisplayMatchHistory = (props) => {
    const [isWinner,setIsWinner] = useState(false);

    useEffect(() => {
        const logged = localStorage.getItem("user");
        if (logged)
        {
            const current = JSON.parse(logged)
                if (props.match.winner_id === current.id)
                {
                    // console.log( " I won ! ");
                    setIsWinner(true);
                    // setEnnemyNickname(props.match.losser.nickname)
                }
                else
                {
                    setIsWinner(false);
                    // setEnnemyNickname(props.match.winner.nickname)

                }

        }
        // eslint-disable-next-line
    },[])
// console.log(" History Props : " , props)
    return (
        <>
 {isWinner ? (
 <>
 <div className='winner-div'>
      <button type="button" className='has-border' >
      <span className="icon material-symbols-outlined">
     {"military_tech"}  Victory      </span> 
      </button>
      </div>
 </>
) : (
    <>
    </>
)}

<div className="Match-History"> 
    <table className="History-Table">
        <tbody>
   <tr>
    <th></th>
    <th></th>
    
    <th>   <div className='neutral-div'>
      <button type="button" className='has-border' >
      <span className="icon material-symbols-outlined">
     {"person"}        </span> 
      </button>
      </div></th>
    <th>
   <div className='neutral-div'>
      <button type="button" className='has-border' >
      <span className="icon material-symbols-outlined">
     {"stadia_controller"}        </span> 
      </button>
      </div>
   </th>
   <th>   <div className='neutral-div'>
      <button type="button" className='has-border' >
      <span className="icon material-symbols-outlined">
     {"person"}        </span> 
      </button>
      </div></th>
</tr>
<tr>
<td>
   <img src = {props.match.winner_avatar}  className="avatar1" height="35" alt="WinnerAvatar"/>
</td>
<td>
<Link style={{color:'#1e90fe'}} to={`/users/${props.match.winner_name}`} >   {props.match.winner_name} </Link>


</td>
    
<td>
<p className='lost-score'>   {props.match.winner_score}</p>
</td>
<td> | </td>
 <td> <p className='lost-score'> {props.match.losser_score}</p></td>
<td> <Link style={{color:'#1e90fe'}} to={`/users/${props.match.looser_name}`} >   {props.match.looser_name} </Link>
</td>


<td>
    
   <img src = {props.match.looser_avatar}  className="avatar" alt="loseravatar"/>
</td>
    </tr>
    </tbody>
    </table>
    </div>
        </>

    )
}


export default DisplayMatchHistory;