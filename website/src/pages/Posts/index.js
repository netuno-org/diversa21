import { Typography } from 'antd';
import { Navigate } from "react-router-dom";
import _service from '@netuno/service-client';
import _auth from '@netuno/auth-client';

const { Title } = Typography;

function Posts() {
    if (_auth.isLogged()) {     
        return <Title level={2}>Hello World</Title>;
    }
    return (<Navigate to="/login" />);
}

export default Posts;