import cv2 as cv
import sys
import os

tile_width = 32
tile_height = 32

input_file_path = sys.argv[1]

[directory, file_name] = os.path.split(input_file_path)
[name, _] = os.path.splitext(file_name)

i = 1
image = cv.imread(input_file_path, cv.IMREAD_UNCHANGED)
for row in range(0, image.shape[0], tile_height):
  for column in range(0, image.shape[1], tile_width):
    tile = image[row:row+tile_width, column:column+tile_height]
    cv.imwrite(directory + '/' + name + '_' + str(i) + '.png', tile)
    i += 1
