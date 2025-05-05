"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Settings2 as Settings2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import TopicHeader from "@/components/topic/TopicHeader";
import TopicModal from "@/components/topic/TopicModal";
import ResourceGrid from "@/components/topic/ResourceGrid";
import ResourceModal from "@/components/topic/ResourceModal";
import DeleteDialog from "@/components/topic/DeleteDialog";
import SearchBar from "@/components/topic/SearchBar";
import { useTopic } from "@/hooks/useTopic";
import { useResources } from "@/hooks/useResources";

export default function TopicPage({ params }: { params: any }) {
  const rawId = (use(params) as { id: string | string[] }).id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const router = useRouter();

  // Accessibility Settings
  const [showSettings, setShowSettings] = useState(false);
  const [colorFilter, setColorFilter] = useState("none");
  const [tempFontSize, setTempFontSize] = useState(16);
  const [tempLetterSpacing, setTempLetterSpacing] = useState(0);
  const settingsRef = useRef(null);

  // Topic state management
  const {
    topicId,
    topicName,
    setTopicName,
    topicModalOpen,
    setTopicModalOpen,
    editMode,
    handleSaveTopic,
    isLoading: isTopicLoading,
  } = useTopic(id);

  // Resource state management
  const {
    media,
    filteredMedia,
    search,
    setSearch,
    resourceModalOpen,
    setResourceModalOpen,
    newResourceType,
    setNewResourceType,
    youtubeUrl,
    setYoutubeUrl,
    pdfTitle,
    setPdfTitle,
    pdfFile,
    setPdfFile,
    handleAddResource,
    deleteDialogOpen,
    setDeleteDialogOpen,
    resourceToDelete,
    setResourceToDelete,
    handleDeleteResource,
    isLoading: isResourceLoading,
    isDeleting,
  } = useResources(id);

  const handleResourceClick = (item: any) => {
    router.push(`/dashboard/resource/${item.id}`);
  };

  const isLoading = isTopicLoading || isResourceLoading;

  const handleCancelModal = () => {
    if (!id) {
      router.push("/dashboard");
    }
    setTopicModalOpen(false);
  };

  return (
    <>
      {/* SVG Filters for Color Blind Modes */}
      <svg width="0" height="0">
        <filter id="protanopia">
          <feColorMatrix
            type="matrix"
            values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0"
          />
        </filter>
        <filter id="deuteranopia">
          <feColorMatrix
            type="matrix"
            values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0"
          />
        </filter>
        <filter id="tritanopia">
          <feColorMatrix
            type="matrix"
            values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0"
          />
        </filter>
      </svg>

      <div
        className="min-h-screen bg-background text-foreground max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-14"
        style={{
          fontSize: `${tempFontSize}px`,
          letterSpacing: `${tempLetterSpacing}em`,
          filter:
            colorFilter !== "none" && colorFilter !== "highContrast"
              ? `url(#${colorFilter})`
              : "none",
        }}
      >
        {/* Topic Modal */}
        <TopicModal
          open={topicModalOpen}
          setOpen={setTopicModalOpen}
          topicName={topicName}
          setTopicName={setTopicName}
          editMode={editMode}
          onSave={handleSaveTopic}
          onCancel={handleCancelModal}
        />

        {/* Topic Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <TopicHeader
            topicName={topicName}
            onClick={() => setTopicModalOpen(true)}
          />

          <Button onClick={() => setResourceModalOpen(true)} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Resource
          </Button>
        </div>

        {/* Resource Modal */}
        <ResourceModal
          open={resourceModalOpen}
          setOpen={setResourceModalOpen}
          resourceType={newResourceType}
          setResourceType={setNewResourceType}
          youtubeUrl={youtubeUrl}
          setYoutubeUrl={setYoutubeUrl}
          pdfTitle={pdfTitle}
          setPdfTitle={setPdfTitle}
          setPdfFile={setPdfFile}
          onAdd={handleAddResource}
          isLoading={isLoading}
          pdfFile={pdfFile}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          resourceTitle={resourceToDelete?.title || ""}
          onDelete={handleDeleteResource}
          isDeleting={isDeleting}
        />

        {/* Search Bar */}
        {media.length > 0 && <SearchBar value={search} onChange={setSearch} />}

        {/* Resource Grid - Wrapped to ignore font size/spacing */}
        <div style={{ fontSize: "16px", letterSpacing: "normal" }}>
          <ResourceGrid
            isLoading={isLoading}
            media={filteredMedia}
            onResourceClick={handleResourceClick}
            onDeleteClick={(item) => {
              setResourceToDelete(item);
              setDeleteDialogOpen(true);
            }}
          />
        </div>
      </div>

      {/* Accessibility Toggle Button */}
      <button
        className="fixed bottom-6 right-6 bg-primary text-black p-3 rounded-full shadow-lg z-[9999]"
        style={{ filter: "none", fontSize: "16px", letterSpacing: "normal" }}
        onClick={() => setShowSettings(!showSettings)}
      >
        <Settings2Icon />
      </button>

      {/* Accessibility Settings Panel */}
      {showSettings && (
        <div
          ref={settingsRef}
          className="fixed bottom-20 right-6 bg-white dark:bg-neutral-900 shadow-lg rounded-xl p-6 w-80 z-[9999] border border-gray-300 dark:border-neutral-700"
          style={{ filter: "none", fontSize: "16px", letterSpacing: "normal" }}
        >
          <h3 className="text-lg font-semibold mb-4">Accessibility Settings</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Display Mode
              </label>
              <select
                className="w-full p-2 border rounded bg-[#171717] text-white"
                value={colorFilter}
                onChange={(e) => setColorFilter(e.target.value)}
              >
                <option value="none">Default</option>
                <option value="protanopia">Red-Blind (Protanopia)</option>
                <option value="deuteranopia">Green-Blind (Deuteranopia)</option>
                <option value="tritanopia">Blue-Blind (Tritanopia)</option>
                <option value="highContrast">High Contrast</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Font Size</label>
              <input
                type="range"
                min="12"
                max="20"
                value={tempFontSize}
                onChange={(e) => setTempFontSize(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <p className="text-sm mt-1">{tempFontSize}px</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Letter Spacing
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={tempLetterSpacing}
                onChange={(e) => setTempLetterSpacing(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <p className="text-sm mt-1">{tempLetterSpacing}em</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}