import { useEffect, useState } from "react";
import _auth from "@netuno/auth-client";
import { Button, Spin, Typography } from "antd";
import { useNavigate, useLocation, useParams } from "react-router-dom";

import usePeople from "../../common/usePeople.js";

import NotFound from "../NotFound";
import ProfileEdit from "./MyProfile/Edit";
import ProfileView from "./MyProfile/View";
import Posts from "./Posts";
import UserProfile from "./UserProfile/View";
import UserProfileEdit from "./UserProfile/Edit";
import People from "./People";
import CreateUser from "../CreateUser";
import InstitutionsList from "./Institutions/List";
import InstitutionView from "./Institutions/View/index.jsx";
import InstitutionForm from "../../components/InstitutionForm";
import LocationList from "./Locations/List";
import Messages from "./Messages";
import Notifications from "./Notifications";

import "./index.less";

const { Title } = Typography;

function ReservedArea() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  if (_auth.isLogged()) {
    const [loading, setLoading] = useState(true);
    const people = usePeople();

    useEffect(() => {
      if (people.data == null) {
        people.load((result) => {
          if (result) {
            setLoading(false);
          } else {
            navigate("/login");
          }
        });
      } else {
        setLoading(false);
      }
    }, [people.data]);

    const getContent = () => {
      if (loading) {
        return (
          <div className="loading">
            <Spin spinning={loading}></Spin>
          </div>
        );
      }
      if (location.pathname === "/profile/edit") {
        return <ProfileEdit />;
      }
      if (location.pathname === "/profile/view") {
        return <ProfileView />;
      }
      if (location.pathname === "/posts") {
        return <Posts />;
      }
      if (location.pathname.startsWith("/u/")) {
        return <UserProfile username={params.username} />;
      }
      if (location.pathname.startsWith("/e/")) {
        return <UserProfileEdit username={params.username} />;
      }
      if (location.pathname === "/people") {
        return <People />;
      }
      if (location.pathname === "/people/create/user") {
        if (!(people.canCreateAnyUser() || people.canCreateMember(people.data?.institution))) {
          navigate('/people');
          return;
        }
        return <CreateUser />;
      }
      if (location.pathname === "/institutions") {
        return <InstitutionsList />;
      }
      if (location.pathname === "/institutions/new") {
        return <InstitutionForm onSuccess={() => navigate('/institutions')} onCancel={() => navigate('/institutions')} />;
      }
      if (location.pathname.match(/^\/institutions\/[\w-]+$/)) {
        return <InstitutionView />;
      }
      if (location.pathname.match(/^\/institutions\/[\w-]+\/edit$/)) {
        const slug = location.pathname.match(/^\/institutions\/([\w-]+)\/edit$/)?.[1];
        return <InstitutionForm slug={slug} onSuccess={() => navigate(`/institutions/${slug}`)} onCancel={() => navigate(`/institutions/${slug}`)} />;
      }
      if (location.pathname === "/locations") {
        if (!people.canManageLocations()) {
          navigate('/');
          return;
        }
        return <LocationList />;
      }
      if (location.pathname === "/messages") {
        if (!people.canChangeUserGroup()) {
          navigate('/');
          return;
        }
        return <Messages />;
      }
      if (location.pathname === "/notifications") {
        if (!people.canChangeUserGroup()) {
          navigate('/');
          return;
        }
        return <Notifications />;
      }
      return <NotFound />;
    };

    const content = getContent();

    return (
      <section className="reserved-area">
        {content}
      </section>
    );
  }

  return (
    <section className="reserved-area">
      <div className="reserved-area__unauthorized">
        <Title>Não Autorizado</Title>
        <p>
          É necessário realizar a autenticação para aceder a área reservada.
        </p>
        <Button type="primary" onClick={() => navigate("/login")}>
          Ir para o Login
        </Button>
      </div>
    </section>
  );
}

export default ReservedArea;
