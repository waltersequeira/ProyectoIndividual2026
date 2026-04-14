import { Container, Row, Col } from "react-bootstrap";

const Categorias = () => {
  return (
    <Container className="mt-3">
      <Row className="align-items-center">
        <Col>
          <h2>
            <i className="bi-tags-fill me-2"></i> Página de Categorías
          </h2>
          <hr /> 
        </Col>
      </Row>
    </Container>
  );
};

export default Categorias;