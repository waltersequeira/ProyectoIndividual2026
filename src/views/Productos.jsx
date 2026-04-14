import { Container, Row, Col } from "react-bootstrap";

const Productos = () => {
  return (
    <Container className="mt-3">
      <Row className="align-items-center">
        <Col>
          <h2>
            <i className="bi-house-fill me-2"></i> Productos
          </h2>
          <p>Listado de productos disponibles en el sistema.</p>
        </Col>
      </Row>
    </Container>
  );
};

export default Productos;