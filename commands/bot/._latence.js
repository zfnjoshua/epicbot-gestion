import os

def check_empty_files(directory):
    for filename in os.listdir(directory):
        file_path = os.path.join(directory, filename)
        if os.path.getsize(file_path) == 0:
            print(f"{file_path} is empty and intentionally left blank.")

if __name__ == "__main__":
    check_empty_files(".")
