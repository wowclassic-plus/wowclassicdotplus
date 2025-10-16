// surveySchema.js

export const schemaSections = {
  Lore: {
    title: "Lore",
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
      new_lore: { type: "string", title: "Do you think Classic Plus should new Lore added?", enum: ["Yes", "No"] },
    },
    required: ["name", "previous_versions","new_lore"],
  },
  Quests: {
    title: "Quests",
    properties: {
      scaling_raids: { type: "string", title: "Do you think Classic Plus should have scaling difficulty levels in raids?", enum: ["Yes", "No"] },
    },
    required: ["scaling_raids"],
  },
  Raids: {
    title: "Raids",
    properties: {
      new_race_class: { type: "string", title: "Do you think Classic Plus should have new race/class combinations?", enum: ["Yes", "No"] },
    },
    required: ["new_race_class"],
  },
  Dungeons: {
    title: "Dungeons",
    properties: {
      currently_play: { type: "string", title: "Do you currently play Classic?", enum: ["Yes", "No"] },
      intend_to_play: { type: "string", title: "Would you intend to play Classic Plus?", enum: ["Yes", "No"] },
    },
    required: ["currently_play", "intend_to_play"],
  },
};

export const uiSchemas = {
  Lore: {
    previous_versions: {
      "ui:widget": "checkboxes",
      "ui:options": { inline: false, grid: true }, // custom rendering in table/grid
    },
  },
  Quests: { scaling_raids: { "ui:widget": "radio" } },
  Raids: { new_race_class: { "ui:widget": "radio" } },
  Dungeons: { currently_play: { "ui:widget": "radio" }, intend_to_play: { "ui:widget": "radio" } },
};

export const sectionColors = {
  Lore: "#FFF9E6",
  Quests: "#E6F7FF",
  Raids: "#F0E6FF",
  Dungeons: "#E6FFE6",
};
