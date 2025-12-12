import ReactDOM from "react-dom/client";
import { Chatbot } from "./Chatbot";
import "./index.css";

const theme = {
  initialMessage: "hello",
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Chatbot
    token="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FwaS1wcm9kLmZ1cm5pc2hrYXJvLmNvbS9sb2dpbiIsImlhdCI6MTc2MzUyOTgyMywiZXhwIjoxNzk1MDY1ODIzLCJuYmYiOjE3NjM1Mjk4MjMsImp0aSI6IjdUWjR0SGpCUGRxU3JwT1giLCJzdWIiOiI5YzFlMjVjYi05MGFiLTQ2OTYtYThmNC03OWQyMzk3OTRlYjciLCJwcnYiOiIyM2JkNWM4OTQ5ZjYwMGFkYjM5ZTcwMWM0MDA4NzJkYjdhNTk3NmY3In0.U0CPwabZ6nkARDSoJ7KIQUPDhyHvDCvb4ftiotKd3GU"
    userId="9c1e25cb-90ab-4696-a8f4-79d239794eb7"
    theme={theme}
  />
);
