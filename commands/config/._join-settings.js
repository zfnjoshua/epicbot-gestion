#!/bin/bash

# Check if the user provided a filename
if [ $# -eq 0 ]; then
    echo "No filename provided. Usage: $0 <filename>"
    exit 1
fi

# Create the file with the specified name and add some content
echo "This is the content of the file: $1" > "$1"

echo "File '$1' has been created!"
