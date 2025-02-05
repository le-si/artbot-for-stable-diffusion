import clsx from 'clsx'
import { useCallback, useState } from 'react'

import DeleteConfirmModal from 'app/_modules/DeleteConfirmModal'
import DropDown from './DropDown'
import { Button } from 'app/_components/Button'
import useLockedBody from 'app/_hooks/useLockedBody'
import styles from './toolbar.module.css'
import {
  IconAdjustments,
  IconArrowBackUp,
  IconArrowDown,
  IconArrowForwardUp,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUp,
  IconDownload,
  IconEraser,
  IconMaskOff,
  IconMinusVertical,
  IconPencil,
  IconTrash
} from '@tabler/icons-react'
import InpaintingCanvas from 'app/_data-models/InpaintingCanvas'
import { useInput } from 'app/_modules/InputProvider/context'
import { SourceProcessing } from '_types/horde'

const DEBUG_MODE = true

const removeImageCanvasData = {
  canvasData: null,
  maskData: null,
  imageType: '',
  source_image: '',
  source_mask: '',
  source_processing: SourceProcessing.Prompt
}

const ToolBarButton = ({ active, btnType, onClick, children }: any) => {
  const classes = [
    styles.border,
    styles.borderWhite,
    styles.p4,
    styles.rounded4,
    styles.activeBorder,
    styles.selectNone
  ]

  if (btnType === 'secondary') {
    classes.push(styles.bgSecondaryHover)
    classes.push(styles.activeBorder) // Repeated, but that's what your original code did
    classes.push(styles.bgSecondaryHover) // Repeated, but that's what your original code did
  } else {
    classes.push(styles.bgDefaultHover)
    classes.push(styles.activeBorder) // Repeated, but that's what your original code did
    classes.push(styles.bgDefaultHover) // Repeated, but that's what your original code did
  }

  if (active) {
    classes.push(styles.bgActive)
    classes.push(styles.activeBg)
  }

  return (
    <button className={clsx(classes)} onClick={onClick}>
      {children}
    </button>
  )
}

const ToolBar = ({ canvas }: { canvas: InpaintingCanvas }) => {
  const { input, setInput } = useInput()
  const [, setLocked] = useLockedBody(false)

  const [activeBrush, setActiveBrush] = useState('paint')
  const [showAdjustmentMenu, setShowAdjustmentMenu] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [brushSize, setBrushSize] = useState(20)

  const handleRemoveClick = () => {
    setInput({ ...removeImageCanvasData })
  }

  const handleAdjustCanvasSize = useCallback(
    (direction: 'top' | 'bottom' | 'left' | 'right', pixels: number = 64) => {
      if (direction === 'top' || direction === 'bottom') {
        setInput({
          height: input.height + pixels
        })
      }

      if (direction === 'left' || direction === 'right') {
        setInput({
          width: input.width + pixels
        })
      }
    },
    [input.height, input.width, setInput]
  )

  const handleWidth = (e: any) => {
    setBrushSize(Number(e.target.value))
    canvas?.setBrushSize(Number(e.target.value))
  }

  return (
    <div className={clsx(styles.toolbar)}>
      <div className="flex flex-row items-center gap-1">
        <ToolBarButton
          active={activeBrush === 'paint'}
          onClick={() => {
            setActiveBrush('paint')
            canvas?.toggleErase(false)
          }}
        >
          <IconPencil stroke="black" />
        </ToolBarButton>
        <ToolBarButton
          active={activeBrush === 'erase'}
          onClick={() => {
            setActiveBrush('erase')
            canvas?.toggleErase(true)
          }}
        >
          <IconEraser stroke="black" />
        </ToolBarButton>
        <IconMinusVertical stroke="#949494" />
        <ToolBarButton onClick={canvas?.undo}>
          <IconArrowBackUp stroke="black" />
        </ToolBarButton>
        <ToolBarButton onClick={canvas?.redo}>
          <IconArrowForwardUp stroke="black" />
        </ToolBarButton>
        <IconMinusVertical stroke="#949494" />
        <ToolBarButton
          onClick={() => {
            canvas?.expandCanvas('bottom', 64)
            handleAdjustCanvasSize('bottom', 64)
          }}
        >
          <IconArrowDown stroke="black" />
        </ToolBarButton>
        <ToolBarButton
          onClick={() => {
            canvas?.expandCanvas('top', 64)
            handleAdjustCanvasSize('top', 64)
          }}
        >
          <IconArrowUp stroke="black" />
        </ToolBarButton>
        <ToolBarButton
          onClick={() => {
            canvas?.expandCanvas('right', 64)
            handleAdjustCanvasSize('right', 64)
          }}
        >
          {/* <IconArrowUp stroke="black" /> */}
          <IconArrowRight stroke="black" />
        </ToolBarButton>
        <ToolBarButton
          onClick={() => {
            canvas?.expandCanvas('left', 64)
            handleAdjustCanvasSize('left', 64)
          }}
        >
          <IconArrowLeft stroke="black" />
        </ToolBarButton>
        <ToolBarButton
          active={showAdjustmentMenu}
          onClick={() => {
            if (showAdjustmentMenu) {
              setShowAdjustmentMenu(false)
            } else {
              setShowAdjustmentMenu(true)
            }
          }}
        >
          <IconAdjustments stroke="black" />
        </ToolBarButton>
        {DEBUG_MODE && (
          <Button onClick={canvas?.saveToDisk}>
            <IconDownload />
          </Button>
        )}
      </div>
      <div>
        <ToolBarButton
          theme="secondary"
          onClick={() => {
            canvas?.clearMaskCanvas()
          }}
        >
          <IconMaskOff stroke="black" />
        </ToolBarButton>
      </div>
      <div>
        <ToolBarButton
          theme="secondary"
          onClick={() => {
            setLocked(true)
            setShowDeleteModal(true)
          }}
        >
          <IconTrash stroke="black" />
        </ToolBarButton>
      </div>
      {showAdjustmentMenu && (
        <DropDown handleClose={() => setShowAdjustmentMenu(false)}>
          <div className="flex flex-col w-full">
            <div className="w-full mb-2">
              <div className="text-gray-900">
                <small>
                  <strong>Brush size ({brushSize} px)</strong>
                </small>
              </div>
              <div className="w-full">
                <input
                  className="w-full"
                  type="range"
                  min={2}
                  max="120"
                  onChange={handleWidth}
                  value={brushSize}
                />
              </div>
            </div>
          </div>
        </DropDown>
      )}
      {showDeleteModal && (
        <DeleteConfirmModal
          onConfirmClick={() => {
            setLocked(false)
            handleRemoveClick()
            setShowDeleteModal(false)
          }}
          closeModal={() => {
            setLocked(false)
            setShowDeleteModal(false)
          }}
        >
          <h3
            className="text-lg font-medium leading-6 text-gray-900"
            id="modal-title"
          >
            Remove image and mask?
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Are you sure you want to remove this image and mask? They will be
              erased. This action cannot be undone.
            </p>
          </div>
        </DeleteConfirmModal>
      )}
    </div>
  )
}

export default ToolBar
