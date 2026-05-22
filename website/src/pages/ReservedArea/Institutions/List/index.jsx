import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Card, Avatar, Spin, Pagination, Empty, Typography, Grid } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import _service from '@netuno/service-client';

import InstitutionDisplay from "../../../../components/InstitutionDisplay";


import usePeople from "../../../../common/usePeople.js";

import ListHeaderFilters from "../../../../components/ListHeaderFilters";

import "./index.less";


const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

function ListInstitution() {
  const loggedUser = usePeople();
  const [loading, setLoading] = useState(true);
  const [institutionList, setInstitutionList] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    size: 10,
    total: 0,
    term: '',
    location: null
  });
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const screenSize = screens.xl
    ? 100
    : screens.lg
      ? 100
      : screens.md
        ? 100
        : screens.sm
          ? 90
          : 70

  useEffect(() => {
    fetchInstitutionList('', null, 1);
  }, []);

  const fetchInstitutionList = (term, location, page) => {
    setLoading(true);
    _service({
      url: 'institution/list',
      data: {
        name: term,
        ...(location && { [location.type + "Uid"]: location.uid }),
        page,
      },
      success: (response) => {
        console.log(response.json)

        const institutions = response.json.data;

        setInstitutionList(institutions);
        console.log('institutions', institutionList);

        setPagination((currentPagination) => ({
          ...currentPagination,
          current: page,
          term,
          location,
          total: institutions.length,
          size: 10
        }));
        setLoading(false);
      },
      fail: () => {
        setLoading(false);
      }
    })
  };

  const handlePaginationChange = (page, pageSize) => {
    setPagination({ ...pagination, current: page, size: pageSize });
    fetchInstitutionList(pagination.term, pagination.location, page);
  }

  const handleInstitutionSearch = (term) => {
    setPagination({ ...pagination, current: 1, term });
    fetchInstitutionList(term, pagination.location, 1);
  };

  const handleLocationChange = (option) => {
    setPagination({ ...pagination, current: 1, location: option });
    fetchInstitutionList(pagination.term, option, 1);
  };

  const handleLocationClear = () => {
    setPagination({ ...pagination, current: 1, location: null });
    fetchInstitutionList(pagination.term, null, 1);
  }

  const handleSearchClear = () => {
    setPagination({ ...pagination, current: 1, term: '' });
    fetchInstitutionList('', pagination.location, 1);
  }

  return (
    <div className="institution-search-container">
      <div className="institution-search">
        <ListHeaderFilters
          title="Instituições"
          createButton={loggedUser.canCreateInstitutions() && {
            icon: <UserAddOutlined />,
            text: "Criar Instituição",
            onClick: () => navigate('/institutions/new'),
          }}
          onSearch={handleInstitutionSearch}
          onLocationChange={handleLocationChange}
          onLocationClear={handleLocationClear}
          onSearchClear={handleSearchClear}
        />
      </div>
      {loading && (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 24 }}>
          <Spin size="large" />
        </div>
      )}
      <div className="results-info">
        <Text type="secondary">
          {pagination.total} {pagination.total !== 1 ? 'Instituições' : 'Instituição'} encontrado{pagination.total !== 1 ? 's' : ''}
        </Text>
      </div>
      {!loading && institutionList.map((institution) => (
        <div key={institution.uid} style={{ width: '100%', marginBottom: '20px'}}>
          <Link to={`/institutions/${institution.slug}`}>
            <Card className="institution-search-result-card" key={institution.uid}>
              <InstitutionDisplay institution={institution} avatarStyle={{ width: `${screenSize}px`, height: `${screenSize}px` }} />
            </Card>
          </Link>
        </div>
      ))}
      <div style={{ width: '100%' }}>
        <Pagination
          style={{ ...(institutionList.length === 0 && !loading ? { marginTop: '20px', display: 'none' } : { marginTop: '20px' }) }}
          align='center'
          total={pagination.total}
          current={pagination.current}
          pageSize={pagination.size}
          onChange={handlePaginationChange}
        />
        {institutionList.length === 0 && !loading && (
          <div style={{ marginTop: '20px' }}>
            <Empty
              description={"Nenhuma instituição corresponde aos filtros aplicados."}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ListInstitution;
