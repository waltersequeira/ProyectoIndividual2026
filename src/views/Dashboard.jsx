import { Container, Card } from "react-bootstrap";

const Dashboard = () => {

    return (
        <Container>
            <br />
            <Card style={{ height: 600 }}>
                <iframe
                    title="estadisticas"
                    width="100%"
                    height="100%"
                    src="https://app.powerbi.com/view?r=eyJrIjoiY2E5ZTMxNTEtMzQ3YS00ZmE0LTg2YTMtNjVhMThkMTMyZjYxIiwidCI6ImU0NzY0NmZlLWRhMjctNDUxOC04NDM2LTVmOGIxNThiYTEyNyIsImMiOjR9"
                    allowFullScreen="true"
                ></iframe>
            </Card>
        </Container>
    );
};

export default Dashboard;