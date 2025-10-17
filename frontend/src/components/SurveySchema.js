// surveySchema.js

export const schemaSections = {
  'General Questions': {
    title: "General",
    properties: {
      name: { type: "string", title: "Name / Character" },
      previous_versions: {
        type: "array",
        title: "What versions of Classic have you played before?",
        items: {
          type: "string",
          enum: ["Hardcore", "SoD", "SoM", "Vanilla", "TBC", "WoTLK", "Cata", "MoP"],
        },
        uniqueItems: true,
      },
    },
    required: ["name", "previous_versions"],
  },
  'Player Questions': {
    title: "Players",
    properties: {
      scaling_raids: { type: "string", title: "Do you think Classic Plus should have scaling difficulty levels in raids?", enum: ["Yes", "No"] },
      scaling_raids2: { type: "string", title: "Do you think Classic Plus should have scaling difficulty levels in raids2?", enum: ["Yes", "No"] },
    },
    required: ["scaling_raids","scaling_raids2"],
  },
  'Systems Questions': {
    title: "Systems",
    properties: {
      new_race_class: { type: "string", title: "Do you think Classic Plus should have new race/class combinations?", enum: ["Yes", "No"] },
    },
    required: ["new_race_class"],
  },
  'World Questions': {
    title: "World",
    properties: {
      currently_play: { type: "string", title: "Do you currently play Classic?", enum: ["Yes", "No"] },
      intend_to_play: { type: "string", title: "Would you intend to play Classic Plus?", enum: ["Yes", "No"] },
    },
    required: ["currently_play", "intend_to_play"],
  },
};

export const uiSchemas = {
  'General Questions': {
    previous_versions: {
      "ui:widget": "checkboxes",
      "ui:options": { inline: false, grid: true }, // custom rendering in table/grid
    },
  },
  'Player Questions': { scaling_raids: { "ui:widget": "radio" }, scaling_raids2: { "ui:widget": "radio" } },
  'Systems Questions': { new_race_class: { "ui:widget": "radio" } },
  'World Questions': { currently_play: { "ui:widget": "radio" }, intend_to_play: { "ui:widget": "radio" } },
};

export const sectionColors = {
  'General Questions': "#FFF9E6",
  'Player Questions': "#E6F7FF",
  'Systems Questions': "#F0E6FF",
  'World Questions': "#E6FFE6",
};
