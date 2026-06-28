import { useCallback, useEffect, useState } from 'react';
import _service from '@netuno/service-client';

const defaultPagination = {
  current: 1,
  size: 10,
  total: 0,
  term: '',
  location: null,
};

function useFilteredPaginatedList({ serviceUrl, requestData }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(defaultPagination);

  const fetchList = useCallback(
    ({
      term = '',
      location = null,
      page = 1,
    } = {}) => {
      setLoading(true);

      _service({
        url: serviceUrl,
        data: {
          name: term,
          ...requestData,
          ...(location && {
            [`${location.type}Uid`]: location.uid,
          }),
          page,
        },

        success: (response) => {

          const { items, pagination: responsePagination } =
            response.json.data;

          setItems(items);

          setPagination((currentPagination) => ({
            ...currentPagination,
            current: page,
            term,
            location,
            total: responsePagination.totalCount,
            size: responsePagination.pageSize,
          }));

          setLoading(false);
        },

        fail: () => {
          setLoading(false);
        },
      });
    },
    [requestData, serviceUrl]
  );

  useEffect(() => {
    fetchList({
      term: pagination.term,
      location: pagination.location,
      page: pagination.current,
    });
  }, [
    pagination.current,
    pagination.term,
    pagination.location,
    fetchList,
  ]);

  const handlePaginationChange = (page, pageSize) => {
    setPagination((currentPagination) => ({
      ...currentPagination,
      current: page,
      size: pageSize,
    }));
  };

  const handleSearch = (term) => {
    setPagination((currentPagination) => ({
      ...currentPagination,
      current: 1,
      term,
    }));
  };

  const handleLocationChange = (location) => {
    setPagination((currentPagination) => ({
      ...currentPagination,
      current: 1,
      location,
    }));
  };

  const handleLocationClear = () => {
    setPagination((currentPagination) => ({
      ...currentPagination,
      current: 1,
      location: null,
    }));
  };

  const handleSearchClear = () => {
    setPagination((currentPagination) => ({
      ...currentPagination,
      current: 1,
      term: '',
    }));
  };

  const refresh = () => {
    fetchList({
      term: pagination.term,
      location: pagination.location,
      page: pagination.current,
    });
  };

  return {
    items,
    loading,
    pagination,
    fetchList,
    handlePaginationChange,
    handleSearch,
    handleLocationChange,
    handleLocationClear,
    handleSearchClear,
    refresh,
  };
}

export default useFilteredPaginatedList;