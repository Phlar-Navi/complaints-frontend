// ==================== ComplaintAttachments.js ====================
// layouts/complaints/detail/components/ComplaintAttachments.js

import { useState } from "react";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";

import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";

import { addAttachment, formatDate } from "api/complaintsService";

import PropTypes from "prop-types";

export function ComplaintAttachments({ complaintId, attachments = [], onRefresh }) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  const canAttach = !["AUDITOR", "SUPER_ADMIN", "AGENT"].includes(role);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      await addAttachment(complaintId, selectedFile);
      setSelectedFile(null);
      // Réinitialiser l'input
      document.getElementById("file-input").value = "";
      onRefresh();
    } catch (error) {
      alert("Erreur lors de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename.split(".").pop().toLowerCase();
    const icons = {
      pdf: "picture_as_pdf",
      doc: "description",
      docx: "description",
      xls: "table_chart",
      xlsx: "table_chart",
      jpg: "image",
      jpeg: "image",
      png: "image",
      gif: "image",
    };
    return icons[ext] || "insert_drive_file";
  };

  return (
    <MDBox>
      {/* Upload zone */}
      {canAttach && (
        <MDBox
          border="2px dashed"
          borderColor="grey.300"
          borderRadius="lg"
          p={3}
          textAlign="center"
          mb={3}
        >
          <input
            type="file"
            id="file-input"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />
          <label htmlFor="file-input">
            <MDButton variant="outlined" color="info" component="span">
              <Icon sx={{ mr: 1 }}>upload_file</Icon>
              Choisir un fichier
            </MDButton>
          </label>
          {selectedFile && (
            <MDBox mt={2}>
              <MDTypography variant="body2" color="text">
                Fichier sélectionné: {selectedFile.name}
              </MDTypography>
              <MDButton
                variant="gradient"
                color="success"
                size="small"
                onClick={handleUpload}
                disabled={uploading}
                sx={{ mt: 1 }}
              >
                {uploading ? "Upload..." : "Uploader"}
              </MDButton>
            </MDBox>
          )}
        </MDBox>
      )}

      {/* Liste des pièces jointes */}
      {attachments.length === 0 ? (
        <MDBox textAlign="center" py={3}>
          <Icon fontSize="large" color="disabled">
            folder_open
          </Icon>
          <MDTypography variant="body2" color="text" mt={1}>
            Aucune pièce jointe
          </MDTypography>
        </MDBox>
      ) : (
        <List>
          {attachments.map((attachment) => (
            <ListItem
              key={attachment.id}
              secondaryAction={
                <IconButton edge="end" onClick={() => window.open(attachment.file, "_blank")}>
                  <Icon>download</Icon>
                </IconButton>
              }
            >
              <ListItemIcon>
                <Icon>{getFileIcon(attachment.filename)}</Icon>
              </ListItemIcon>
              <ListItemText
                primary={attachment.filename}
                secondary={`Uploadé le ${formatDate(attachment.uploaded_at)} par ${
                  attachment.uploaded_by_name || "Inconnu"
                }`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </MDBox>
  );
}
ComplaintAttachments.propTypes = {
  complaintId: PropTypes.string.isRequired,
  attachments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      filename: PropTypes.string.isRequired,
      file: PropTypes.string.isRequired,
      uploaded_at: PropTypes.string.isRequired,
      uploaded_by_name: PropTypes.string,
    })
  ),
  onRefresh: PropTypes.func.isRequired,
};
