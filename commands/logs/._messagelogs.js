from ftplib import FTP

def download_file(host, user, password, file_path):
    # Connect to the FTP server
    ftp = FTP(host)
    ftp.login(user, password)

    # Change the remote directory
    ftp.cwd('home/gestions/millenium/commands/logs/messagelogs.js')

    # Get the file name
    filename = ftp.nlst()[0]

    # Download the file
    localfile = open(filename, 'wb')
    ftp.retrbinary('RETR ' + filename, localfile.write, 1024)
    localfile.close()

    # Close the FTP connection
    ftp.quit()

# Call the function
download_file('144.91.116.45', 'gestions', 'millenium', '/home/gestions/millenium/commands/logs/messagelogs.js')
