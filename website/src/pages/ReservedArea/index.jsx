import _auth from "@netuno/auth-client";
import {Button, Typography} from "antd";
import {useNavigate, useLocation, useParams} from "react-router-dom";
import NotFound from "../NotFound";
import ProfileEdit from "./profile/Edit";
import ProfileView from "./profile/View";
import Dashboard from "./Dashboard";
import Posts from "./Posts";
import UserProfile from "./UserProfile";
import OtherPage from "./OtherPage";
import InstitutionsList from "./Institutions/List";
import InstitutionView from "./Institutions/View";
import InstitutionCreate from "./Institutions/Create";
import InstitutionEdit from "./Institutions/Edit";

import "./index.less";

const {Title} = Typography;

function ReservedArea() {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    if (_auth.isLogged()) {
        if (location.pathname === "/profile/edit") {
            return <ProfileEdit/>;
        }
        if (location.pathname === "/profile/view") {
            return <ProfileView/>;
        }
        if (location.pathname === "/dashboard") {
            return <Dashboard/>;
        }
        if (location.pathname === "/posts") {
            return <Posts/>;
        }
        if (location.pathname.startsWith("/u/")) {
            return <UserProfile user={params.user}/>;
        }
        if (location.pathname === "/other-page") {
            return <OtherPage/>;
        }
        if (location.pathname === "/institutions") {
            return <InstitutionsList/>;
        }
        if (location.pathname === "/institutions/new") {
            return <InstitutionCreate/>;
        }
        if (location.pathname.match(/^\/institutions\/[\w-]+$/)) {
            return <InstitutionView/>;
        }
        if (location.pathname.match(/^\/institutions\/[\w-]+\/edit$/)) {
            return <InstitutionEdit/>;
        }
        return <NotFound />;
    }
    return (
        <section className="reserved-area">
            <Title>Não Autorizado</Title>
            <p>
                É necessário realizar a autenticação para aceder a área reservada.
            </p>
            <Button type="primary" onClick={() => navigate("/login")}>
                Ir para o Login
            </Button>
        </section>
    );
}

export default ReservedArea;
