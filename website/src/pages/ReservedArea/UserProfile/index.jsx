import { useParams } from "react-router-dom";
import {Typography} from "antd";

import "./index.less";

const { Title } = Typography;

function User({user}) {
  return (
    <section class="user-profile">
      <Title level={1}>{user}</Title>
      <div>
        <p>Perfil do usuário aqui...</p>
      </div>
    </section>
  )
}

export default User;
