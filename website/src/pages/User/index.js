import { useParams } from "react-router-dom";

function User() {
    const {user} = useParams();
    
    return (
        <h1>{user}</h1>
    )
}

export default User;