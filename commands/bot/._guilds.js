from ftplib import FTP
import urllib.request

def download_file_from_ftp(host, user, password, file_path, destination_path):
    # Connect to the FTP server
    ftp = FTP(host)
    ftp.login(user, password)

    # Download the file
    filename = file_path.split("/")[-1]
    with open(destination_path + "/" + filename, "wb") as f:
        ftp.retrbinary("RETR " + file_path, f.write)

    # Close the FTP connection
    ftp.quit()

# Usage
download_file_from_ftp("144.91.116.45", "gestions", "millenium", "/home/gestions/millenium/commands/bot/guilds.js", "path/to/destination")
