import { useState, useEffect } from 'react';
import { Form, Modal, Input, Select } from 'antd';

import _service from '@netuno/service-client';
import globalNotification from '../../../../common/globalNotification';

function LocationModal({
  visible,
  activeTab,
  editingItem,
  allCountries,
  allStates,
  onClose,
  onSuccess
}) {
  const [form] = Form.useForm();
  const [isSaving, setIsSaving] = useState(false);

  // Synchronize form fields whenever the modal opens or the editing item changes
  useEffect(() => {
    if (visible) {
      if (editingItem) {
        form.setFieldsValue({
          ...editingItem,
          countryUid: editingItem.countryUid || editingItem.country_id,
          stateUid: editingItem.stateUid || editingItem.state_id
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, editingItem, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setIsSaving(true);

      const isEditing = !!editingItem?.uid;
      let url = `location/${activeTab}`;

      // Normalize inputs: remove trailing spaces to prevent DB inconsistencies
      const data = { name: values.name.trim() };

      if (isEditing) data.uid = editingItem.uid;

      if (activeTab === 'country') {
        data.code = values.code.trim().toUpperCase();
      } else if (activeTab === 'state') {
        data.code = values.code.trim().toUpperCase();
        data.countryUid = values.countryUid;
      } else if (activeTab === 'city') {
        data.stateUid = values.stateUid;
      }

      _service({
        url,
        method: isEditing ? 'PUT' : 'POST',
        data,
        success: ({ json }) => {
          if (json?.result) {
            globalNotification.success({
              title: 'Sucesso',
              description: isEditing ? 'Registro atualizado com sucesso.' : 'Registro guardado com sucesso.'
            });
            onSuccess() && onSuccess();
            onClose() && onClose();
          } else {
            globalNotification.error({
              title: 'Erro',
              description: json?.error || 'Não foi possível guardar o registro.'
            });
          }
          setIsSaving(false);
        },
        fail: () => {
          globalNotification.error({
            title: 'Falha de comunicação',
            description: 'Falha de comunicação ao guardar o registro.'
          });
          setIsSaving(false);
        },
      });
    } catch (e) {
      console.error(e);
      setIsSaving(false);
    }
  };

  return (
    <>
      <Modal
        title={editingItem ? 'Editar Registro' : 'Novo Registro'}
        open={visible}
        onOk={handleSave}
        onCancel={onClose}
        okText="Guardar"
        cancelText="Cancelar"
        confirmLoading={isSaving}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Nome" rules={[{ required: true, message: 'O nome é obrigatório!' }]}>
            <Input />
          </Form.Item>

          {(activeTab === 'country' || activeTab === 'state') && (
            <Form.Item
              name="code"
              label="Código"
              rules={[
                { required: true, message: 'O código é obrigatório!' },
                { max: 3, message: 'O código não pode ter mais de 3 letras.' },
                { pattern: /^[a-zA-Z]+$/, message: 'Apenas letras são permitidas.' }
              ]}
            >
              <Input placeholder="Ex: PT, BR, SP" />
            </Form.Item>
          )}

          {activeTab === 'state' && (
            <Form.Item name="countryUid" label="País" rules={[{ required: true, message: 'O país é obrigatório!' }]}>
              <Select
                placeholder="Selecione um país"
                options={allCountries.map(c => ({ value: c.uid, label: c.name }))}
                showSearch={{ optionFilterProp: "label" }}
              />
            </Form.Item>
          )}

          {activeTab === 'city' && (
            <Form.Item name="stateUid" label="Estado" rules={[{ required: true, message: 'O estado é obrigatório!' }]}>
              <Select
                placeholder="Selecione um estado"
                options={allStates.map(s => ({ value: s.uid, label: `${s.name} | ${s.countryName}` }))}
                showSearch={{ optionFilterProp: "label" }}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
}

export default LocationModal;