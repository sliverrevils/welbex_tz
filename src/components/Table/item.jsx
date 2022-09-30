


export default function Item({name,date,count,distance}){

    return(
        <tr>            
            <td>{new Date(date.split(' ')[0]).toLocaleDateString()}</td>
            <td>{name}</td>
            <td>{count}</td>
            <td>{distance}</td>
        </tr>
    )
}