// @mui material components
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// React
import { useState } from "react";

// API
import { addComment, COMMENT_TYPE_LABELS, formatDate } from "api/complaintsService";

import PropTypes from "prop-types";

function ComplaintComments({ complaintId, comments = [], onRefresh }) {
  const [newComment, setNewComment] = useState({
    note: "",
    type: "INTERNAL",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.note.trim()) return;

    try {
      setLoading(true);
      await addComment(complaintId, newComment);
      setNewComment({ note: "", type: "INTERNAL" });
      onRefresh();
    } catch (error) {
      alert("Erreur lors de l'ajout du commentaire");
    } finally {
      setLoading(false);
    }
  };

  const getCommentTypeColor = (type) => {
    const colors = {
      INTERNAL: "warning",
      PUBLIC: "success",
      SYSTEM: "info",
    };
    return colors[type] || "default";
  };

  return (
    <MDBox>
      {/* Formulaire d'ajout */}
      <Card sx={{ p: 2, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <MDBox mb={2}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Ajouter un commentaire"
              value={newComment.note}
              onChange={(e) => setNewComment({ ...newComment, note: e.target.value })}
              placeholder="Écrivez votre commentaire ici..."
            />
          </MDBox>
          <MDBox display="flex" justifyContent="space-between" alignItems="center">
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={newComment.type}
                onChange={(e) => setNewComment({ ...newComment, type: e.target.value })}
                label="Type"
                size="small"
              >
                <MenuItem value="INTERNAL">Interne</MenuItem>
                <MenuItem value="PUBLIC">Public</MenuItem>
              </Select>
            </FormControl>
            <MDButton
              variant="gradient"
              color="info"
              type="submit"
              disabled={loading || !newComment.note.trim()}
            >
              {loading ? "Envoi..." : "Ajouter le commentaire"}
            </MDButton>
          </MDBox>
        </form>
      </Card>

      {/* Liste des commentaires */}
      {comments.length === 0 ? (
        <MDBox textAlign="center" py={3}>
          <MDTypography variant="body2" color="text">
            Aucun commentaire pour le moment
          </MDTypography>
        </MDBox>
      ) : (
        <List>
          {comments.map((comment) => (
            <ListItem key={comment.id} alignItems="flex-start" sx={{ px: 0 }}>
              <ListItemAvatar>
                <Avatar>{comment.user_name?.charAt(0) || "?"}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <MDTypography variant="button" fontWeight="medium">
                      {comment.user_name || "Utilisateur inconnu"}
                    </MDTypography>
                    <Chip
                      label={COMMENT_TYPE_LABELS[comment.type]}
                      color={getCommentTypeColor(comment.type)}
                      size="small"
                    />
                  </MDBox>
                }
                secondary={
                  <>
                    <MDTypography variant="body2" color="text" sx={{ mt: 1 }}>
                      {comment.note}
                    </MDTypography>
                    <MDTypography variant="caption" color="text" sx={{ mt: 1, display: "block" }}>
                      {formatDate(comment.created_at)}
                    </MDTypography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </MDBox>
  );
}

export default ComplaintComments;

ComplaintComments.propTypes = {
  complaintId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  comments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      note: PropTypes.string,
      type: PropTypes.string,
      user_name: PropTypes.string,
      created_at: PropTypes.string,
    })
  ),
  onRefresh: PropTypes.func.isRequired,
};
