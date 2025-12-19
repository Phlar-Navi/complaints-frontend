// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Divider from "@mui/material/Divider";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import TimelineItem from "examples/Timeline/TimelineItem";
import PropTypes from "prop-types";

AssignmentOverview.propTypes = {
  stats: PropTypes.shape({
    overview: PropTypes.shape({
      assigned: PropTypes.number.isRequired,
      unassigned: PropTypes.number.isRequired,
      urgent_unhandled: PropTypes.number,
      overdue: PropTypes.number,
    }).isRequired,
    workload: PropTypes.arrayOf(
      PropTypes.shape({
        agent_id: PropTypes.string.isRequired,
        assigned_count: PropTypes.number.isRequired,
      })
    ),
  }),
};

function AssignmentOverview({ stats }) {
  if (!stats || !stats.overview) {
    return null;
  }

  const { overview, workload } = stats;

  // Calculer le pourcentage d'assignation
  const totalActive = overview.assigned + overview.unassigned;
  const assignedPercentage =
    totalActive > 0 ? ((overview.assigned / totalActive) * 100).toFixed(0) : 0;

  // Top 3 des agents les plus chargés
  const topAgents = workload?.slice(0, 3) || [];

  return (
    <Card sx={{ height: "100%" }}>
      <MDBox pt={3} px={3}>
        <MDTypography variant="h6" fontWeight="medium">
          Vue d&apos;ensemble des assignations
        </MDTypography>
        <MDBox mt={0} mb={2}>
          <MDTypography variant="button" color="text" fontWeight="regular">
            <MDTypography display="inline" variant="body2" verticalAlign="middle">
              <Icon
                sx={{
                  // 🔧 CORRECTION : destructurer success ET warning
                  color: ({ palette: { success, warning } }) =>
                    assignedPercentage >= 70 ? success.main : warning.main,
                }}
              >
                {assignedPercentage >= 70 ? "check_circle" : "warning"}
              </Icon>
            </MDTypography>
            &nbsp;
            <MDTypography variant="button" color="text" fontWeight="medium">
              {assignedPercentage}%
            </MDTypography>{" "}
            des plaintes assignées
          </MDTypography>
        </MDBox>
      </MDBox>

      <MDBox p={2}>
        {/* Plaintes non assignées */}
        <TimelineItem
          color={overview.unassigned > 10 ? "error" : "warning"}
          icon="assignment_late"
          title={`${overview.unassigned} plaintes non assignées`}
          dateTime={overview.unassigned > 0 ? "Action requise" : "Tout est assigné"}
        />

        {/* Plaintes assignées */}
        <TimelineItem
          color="success"
          icon="assignment_turned_in"
          title={`${overview.assigned} plaintes assignées`}
          dateTime="En cours de traitement"
        />

        {/* Plaintes urgentes */}
        {overview.urgent_unhandled > 0 && (
          <TimelineItem
            color="error"
            icon="priority_high"
            title={`${overview.urgent_unhandled} plaintes urgentes`}
            dateTime="Attention immédiate requise"
          />
        )}

        {/* Plaintes en retard SLA */}
        {overview.overdue > 0 && (
          <TimelineItem
            color="dark"
            icon="schedule"
            title={`${overview.overdue} plaintes en retard`}
            dateTime="SLA dépassé"
          />
        )}

        {/* Divider */}
        {topAgents.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <MDTypography variant="caption" color="text" fontWeight="bold" px={2}>
              AGENTS LES PLUS CHARGÉS
            </MDTypography>
          </>
        )}

        {/* Top agents */}
        {topAgents.map((agent, index) => (
          <TimelineItem
            key={agent.agent_id}
            color={
              agent.assigned_count > 10 ? "error" : agent.assigned_count > 5 ? "warning" : "info"
            }
            icon="person"
            title={`${agent.agent_name}`}
            dateTime={`${agent.assigned_count} plainte${agent.assigned_count > 1 ? "s" : ""}${
              agent.overdue_count > 0 ? ` (${agent.overdue_count} en retard)` : ""
            }`}
            lastItem={index === topAgents.length - 1}
          />
        ))}

        {/* Aucun agent chargé */}
        {topAgents.length === 0 && (
          <MDBox px={2} py={1}>
            <MDTypography variant="button" color="text" fontWeight="regular">
              Aucune donnée sur les agents disponible
            </MDTypography>
          </MDBox>
        )}
      </MDBox>
    </Card>
  );
}

export default AssignmentOverview;
