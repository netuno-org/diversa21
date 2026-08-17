import { useState } from "react";
import { Modal, Checkbox, Button, Typography } from "antd";
import _service from "@netuno/service-client";
import globalNotification from "../../common/globalNotification.js";

import TermsContent from "../TermsContent";
import PrivacyContent from "../PrivacyContent";

import "./index.less";

const { Paragraph } = Typography;

function LegalAcceptanceModal({ visible, onAccepted }) {
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [readingContent, setReadingContent] = useState(null);

  const handleAccept = () => {
    if (!agreedTerms || !agreedPrivacy) {
      return;
    }
    setLoading(true);
    _service({
      method: 'POST',
      url: 'people/me/accept-terms',
      success: (response) => {
        setLoading(false);
        if (response.json.result) {
          onAccepted && onAccepted(response.json.acceptedTermsAt || new Date().toISOString());
        } else {
          globalNotification.warning({
            title: 'Aceite dos Termos',
            description: response.json.error || 'Não foi possível confirmar o aceite.',
          });
        }
      },
      fail: (e) => {
        setLoading(false);
        console.error('Aceite dos Termos', e);
        globalNotification.serviceFail({
          title: 'Aceite dos Termos',
          description: 'Ocorreu um erro ao confirmar o aceite. Tente novamente mais tarde.',
        });
      }
    });
  };

  const isReading = !!readingContent;
  
  const modalTitle = readingContent === 'terms' ? "Termos e Condições"
                   : readingContent === 'privacy' ? "Política de Privacidade"
                   : "Aceite dos Termos e Condições";

  const modalFooter = isReading ? [
    <Button key="back" onClick={() => setReadingContent(null)}>
      Voltar aos Aceites
    </Button>
  ] : [
    <Button
      key="accept"
      type="primary"
      loading={loading}
      disabled={!agreedTerms || !agreedPrivacy}
      onClick={handleAccept}
      className="legal-acceptance-modal__accept-button"
    >
      Aceitar e Continuar
    </Button>
  ];

  return (
    <Modal
      title={modalTitle}
      open={visible}
      closable={false}
      mask={{ closable: false }}
      width={isReading ? 700 : 520}
      styles={{
        mask: {
          backgroundColor: '#ffffff',
          opacity: 1,
        }
      }}
      footer={modalFooter}
      className="legal-acceptance-modal"
    >
      
      {readingContent === 'terms' && (
        <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '8px' }}>
          <TermsContent />
        </div>
      )}

      {readingContent === 'privacy' && (
        <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '8px' }}>
          <PrivacyContent />
        </div>
      )}

      {!readingContent && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="legal-acceptance-modal__content">
          <Paragraph style={{ marginBottom: 0 }}>
            Para continuar a usar a plataforma, é necessário aceitar:
          </Paragraph>
          <Checkbox
            checked={agreedTerms}
            onChange={(event) => setAgreedTerms(event.target.checked)}
          >
            Li e aceito os <a onClick={() => setReadingContent('terms')}>Termos e Condições</a>.
          </Checkbox>
          <Checkbox
            checked={agreedPrivacy}
            onChange={(event) => setAgreedPrivacy(event.target.checked)}
          >
            Li e aceito a <a onClick={() => setReadingContent('privacy')}>Política de Privacidade</a>.
          </Checkbox>
        </div>
      )}
      
    </Modal>
  );
}

export default LegalAcceptanceModal;